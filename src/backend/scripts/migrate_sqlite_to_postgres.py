"""Copy local SQLite data into PostgreSQL without truncating the destination.

Run from src/backend with DATABASE_URL set to the Render PostgreSQL URL:
    python scripts/migrate_sqlite_to_postgres.py --sqlite-path gridpilot.db
"""

import argparse
import os
import sys
from pathlib import Path

from sqlalchemy import MetaData, create_engine, insert, select, text
from sqlalchemy.exc import SQLAlchemyError

BACKEND_ROOT = Path(__file__).resolve().parents[1]
PROJECT_ROOT = BACKEND_ROOT.parent.parent
sys.path.insert(0, str(BACKEND_ROOT))

from app.db.database import Base  # noqa: E402
from app.db import models  # noqa: F401,E402


def destination_engine():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise RuntimeError("DATABASE_URL must be set to the PostgreSQL destination.")
    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql+psycopg://", 1)
    elif database_url.startswith("postgresql://"):
        database_url = database_url.replace("postgresql://", "postgresql+psycopg://", 1)
    if not database_url.startswith("postgresql+psycopg://"):
        raise RuntimeError("DATABASE_URL must point to PostgreSQL for this migration.")
    return create_engine(database_url, pool_pre_ping=True)


def migrate(sqlite_path: Path) -> None:
    if not sqlite_path.exists():
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")

    source = create_engine(f"sqlite:///{sqlite_path.resolve()}")
    destination = destination_engine()
    Base.metadata.create_all(destination)

    source_metadata = MetaData()
    source_metadata.reflect(bind=source)
    destination_metadata = MetaData()
    destination_metadata.reflect(bind=destination)

    with source.connect() as source_connection, destination.begin() as destination_connection:
        for table_name in [table.name for table in Base.metadata.sorted_tables]:
            source_table = source_metadata.tables.get(table_name)
            destination_table = destination_metadata.tables.get(table_name)
            if source_table is None or destination_table is None:
                print(f"{table_name}: skipped (table missing)")
                continue

            rows = source_connection.execute(select(source_table)).mappings().all()
            inserted = 0
            skipped = 0
            destination_columns = {column.name for column in destination_table.columns}
            primary_key_columns = [column.name for column in destination_table.primary_key]

            for row in rows:
                values = {key: value for key, value in row.items() if key in destination_columns}
                if primary_key_columns:
                    key_filter = [
                        destination_table.c[column] == values[column]
                        for column in primary_key_columns
                        if column in values
                    ]
                    if key_filter and destination_connection.execute(
                        select(destination_table).where(*key_filter).limit(1)
                    ).first():
                        skipped += 1
                        continue
                destination_connection.execute(insert(destination_table).values(**values))
                inserted += 1

            for column in destination_table.primary_key:
                if column.type.python_type is int:
                    destination_connection.execute(
                        text(
                            f'SELECT setval(pg_get_serial_sequence(:table_name, :column_name), '
                            f'COALESCE(MAX("{column.name}"), 1), '
                            f'MAX("{column.name}") IS NOT NULL) FROM "{table_name}"'
                        ).bindparams(table_name=table_name, column_name=column.name)
                    )
            print(f"{table_name}: inserted {inserted}, skipped {skipped}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--sqlite-path",
        type=Path,
        default=PROJECT_ROOT / "src" / "backend" / "gridpilot.db",
    )
    args = parser.parse_args()
    try:
        migrate(args.sqlite_path)
    except (OSError, SQLAlchemyError, RuntimeError) as error:
        print(f"Migration failed: {error}", file=sys.stderr)
        raise SystemExit(1) from error