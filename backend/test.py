import os
import sys
import asyncio
import polars as pl
import time

import logging
logging.basicConfig(level=logging.INFO)

sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))
from src.database.xata.database import DatabaseManager


async def test_connect_disconnect():
    # All 13 databases with clean API
    db_zeus = DatabaseManager(credentials_path="pg-zeus.txt")
    db_ares = DatabaseManager(credentials_path="pg-ares.txt")
    db_boreas = DatabaseManager(credentials_path="pg-boreas.txt")
    db_clio = DatabaseManager(credentials_path="pg-clio.txt")
    db_demeter = DatabaseManager(credentials_path="pg-demeter.txt")
    db_erebus = DatabaseManager(credentials_path="pg-erebus.txt")
    db_gaia = DatabaseManager(credentials_path="pg-gaia.txt")
    db_hades = DatabaseManager(credentials_path="pg-hades.txt")
    db_iris = DatabaseManager(credentials_path="pg-iris.txt")
    db_kratos = DatabaseManager(credentials_path="pg-kratos.txt")
    db_morpheus = DatabaseManager(credentials_path="pg-morpheus.txt")
    db_ophion = DatabaseManager(credentials_path="pg-ophion.txt")
    db_phobos = DatabaseManager(credentials_path="pg-phobos.txt")


    databases = [db_zeus, db_ares, db_boreas, 
                 db_clio, db_demeter, db_erebus, 
                 db_gaia, db_hades, db_iris, 
                 db_kratos, db_morpheus, db_ophion, db_phobos]

    # Connect to all databases concurrently - FAST!
    print("Starting concurrent connection to all 13 databases...")
    start_time = time.time()
    await asyncio.gather(*[db.connect() for db in databases])
    connect_time = time.time() - start_time
    print(f"✅ Connected to all 13 databases in {connect_time:.2f} seconds!")
    
    # Disconnect from all databases concurrently - FAST!
    print("Starting concurrent disconnection from all 13 databases...")
    start_time = time.time()
    await asyncio.gather(*[db.disconnect() for db in databases])
    disconnect_time = time.time() - start_time
    print(f"✅ Disconnected from all 13 databases in {disconnect_time:.2f} seconds!")
    
    print(f"🚀 Total time: {connect_time + disconnect_time:.2f} seconds (vs ~26 seconds sequential!)")

if __name__ == "__main__":
    asyncio.run(test_connect_disconnect())
