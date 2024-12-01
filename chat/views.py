from django.shortcuts import render
from django.http import HttpResponse
from django.shortcuts import render
from django.shortcuts import redirect
from django.http import JsonResponse
# Create your views here.'
from datetime import datetime
from chat.models import Room,Message
from django.utils import timezone

def home(request):
    context={"rooms":Room.objects.all()}
    return render(request,'home.html',context)

def room(request,room_id):
    username=request.GET.get("username")
    print("username=",username)
    room_details_obj=Room.objects.get(id=str(room_id))
    context={'username':username,'room_name':room_details_obj.name,'room_details':room_details_obj}
    print("context=",context)
    return render(request,'room.html',context)
    
def checkview(request):
    room=request.POST['room_name']
    username=request.POST.get('username',None)
    if username=="" or username==None:
        username=request.user.username
    room_query=Room.objects.filter(name=room)
    if room_query.exists():
        room_obj=room_query[0]
        return redirect('/chat/room/'+str(room_obj.id)+'/?username='+username)
    else:
        new_room=Room.objects.create(name=room,creator=request.user.username,date_time=datetime.now(timezone.utc))
        new_room.save()
        return redirect('/chat/room/'+str(new_room.id)+'/?username='+username)


def send(request):
    message=request.POST['message']
    username=request.POST['username']
    room_id=request.POST['room_id']
    room_obj=Room.objects.get(id=int(room_id))
    print("send message=",message," username ",username," room_obj ",room_obj)
    new_message=Message.objects.create(value=message,user=username,room=room_obj,date=datetime.now(timezone.utc))
    new_message.save()
    return HttpResponse('Message sent successfully')

def getMessage(request,room):
    print("")
    try:
        room_obj=Room.objects.get(name=room)
        messages=Message.objects.filter(room=room_obj)
        messages_values=list(messages.values())
    except:
        print("$$$$$$$Exception first Room ")
        messages_values=["No Message","No Message"]
    # print("messages=",messages)
    
    #print("get message=",messages," username ",messages[0].user," room_obj ",room_obj)
    return JsonResponse({"messages":messages_values})