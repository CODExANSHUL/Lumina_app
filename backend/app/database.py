# from sqlalchemy import create_engine
# from sqlalchemy.orm import sessionmaker

# # 1. Define your URL connection string
# # db_url = "mysql+pymysql://root:your_password@localhost:3306/my_database"

# # 2. Create the engine
# # engine = create_engine(db_url)

# # 3. Test and use the connection
# # with engine.connect() as connection:
#     # result = connection.execute("SELECT VERSION();")
#     # print(f"Database version: {result.fetchone()[0]}")


# db_url = "mysql://project:Anshul22%40@localhost:3306/project"
# engine = create_engine(db_url)
# session = sessionmaker(autocommit=False, autoflush=False, bind=engine)

from sqlalchemy import create_engine

from sqlalchemy.orm import declarative_base

from sqlalchemy.orm import sessionmaker

from app.config import settings


engine = create_engine(

    settings.DATABASE_URL,

    pool_pre_ping=True,

    future=True,

    connect_args={
        "prepare_threshold": None
    }

)

SessionLocal = sessionmaker(

    autocommit=False,

    autoflush=False,

    bind=engine

)

Base = declarative_base()


def get_db():

    db = SessionLocal()

    try:

        yield db

    finally:

        db.close()