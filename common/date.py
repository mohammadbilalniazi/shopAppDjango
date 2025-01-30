
from datetime import datetime
import pytz
from jalali_date import  date2jalali

def handle_day_out_of_range(date_str):
    year=date_str.split("-")[-3]
    month=date_str.split("-")[-2]
    day=date_str.split("-")[-1]

    day=int(day)-1
    date_str=year+"-"+month+"-"+str(day)
    return date_str

def current_shamsi_date():
   
    date_miladi=pytz.timezone('Asia/Kabul').localize(datetime.now()).strftime("%Y-%m-%d")
    date_miladi_obj=datetime.strptime(date_miladi,"%Y-%m-%d")
    date_shamsi=date2jalali(date_miladi_obj)
    date_shamsi=str(date_shamsi)
    # fisclayear=datetime.now().strftime('%Y')
    # print("date_shamsi,date_qamari,date_miladi ",date_shamsi," ",date_qamari," ",date_miladi)
    return date_shamsi #all strings