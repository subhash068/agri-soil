import asyncio
from sqlalchemy import text
from database import engine

async def cleanup():
    async with engine.begin() as conn:
        res1 = await conn.execute(text("DELETE FROM district_boundaries WHERE name != 'NTR District'"))
        
        ntr_mandals = "('Vijayawada (Rural)', 'Vijayawada (Urban)', 'Ibrahimpatnam', 'Kanchikacherla', 'Mylavaram', 'Nandigama')"
        
        # Keep only NTR mandals and update their district name
        res2 = await conn.execute(text(f"DELETE FROM mandal_boundaries WHERE mandal_name NOT IN {ntr_mandals}"))
        await conn.execute(text(f"UPDATE mandal_boundaries SET district_name = 'NTR District' WHERE mandal_name IN {ntr_mandals}"))
        
        res3 = await conn.execute(text(f"DELETE FROM village_boundaries WHERE mandal_name NOT IN {ntr_mandals}"))
        await conn.execute(text(f"UPDATE village_boundaries SET district_name = 'NTR District' WHERE mandal_name IN {ntr_mandals}"))
        
        print(f"Deleted {res1.rowcount} districts, {res2.rowcount} mandals, {res3.rowcount} villages")

if __name__ == '__main__':
    asyncio.run(cleanup())
