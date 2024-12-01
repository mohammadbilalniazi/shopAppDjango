# for bill_receiver in Bill_Receiver.objects.all():
#     organization_query=Organization.objects.filter(name=bill_receiver.bill_rcvr_org)
#     if organization_query.count()>0:
#         org=organization_query[0]
#         obj=Bill_Receiver2(bill=bill_receiver.bill,bill_rcvr_org=org,store=bill_receiver.store)
#         # print("obj ",model_to_dict(obj))
#         obj.save()