from django.db import models
from bill.models import Bill
EXPENSE_TYPE=((1,"KERAYA"),(2,"FOOD"),(3,"BARQ"),(5,"HOME_EXPENSE"))
class Expense(models.Model):
    bill=models.OneToOneField(Bill,on_delete=models.CASCADE)
    expense_type=models.SmallIntegerField(default=1)
