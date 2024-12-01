from django.db import models
from bill.models import Bill
EXPENSE_TYPE=((1,"KERAYA"),(2,"FOOD"),(3,"BARQ"),(5,"HOME_EXPENSE"))
class Expense(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    expense_type=models.SmallIntegerField(default=1)
    # status=models.SmallIntegerField(choices=STATUS,default=0) # 0 created 1 approved 2 reversed  3  rejected
    # currency=models.CharField(max_length=7,default="afg")
    # shipment_location=models.ForeignKey(Location,on_delete=models.DO_NOTHING,null=True,to_field='city',default=None)
 