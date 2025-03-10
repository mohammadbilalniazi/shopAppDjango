

# from multiprocessing.sharedctypes import RawArray
# from django.http import JsonResponse
# from django.shortcuts import HttpResponse
# from .models import *
# from .serializer import TranslationSerializer
# from rest_framework.decorators import api_view
# from rest_framework import status
# from rest_framework.response import Response
# import json
# from deep_translator import GoogleTranslator,MyMemoryTranslator 


# @api_view(['GET'])
# def select_translations(request,src,dest):
#     print("src ",src," dest ",dest)
#     language_obj=Languages.objects.get(language=dest)# destination 
#     data=Language_Detail.objects.filter(src='en',dest=language_obj).values_list("id_field","value","text")    
#     return Response(data=data)

# ###############sudo code ############
# # if language translation from one text to other in case of 

# @api_view(['POST'])
# def save_translations(request,src,dest):
#     # print("request.body=",request.body)
#     print("src ",src," dest ",dest)
#     # raw_data=request.body
#     raw_data=request.data
#     print("raw_data ",raw_data)
#     # (id_field,src,languages,text,value)
#     language_obj=Languages.objects.get(language=dest)# destination 
#     # list_data_dict=data_dict['language_insert']
#     list_data_dict=raw_data['language_insert']
#     # return Response({"message":"success"})
#     for dict in list_data_dict:
#         id_field=dict['id_field']
#         text=dict['text']
#         # language_obj=Languages.objects.get(language=dest)# destination 
#         # src='auto'
#         print("\n translated ",dict)
#         # return Response()
#         lang_detail_query=Language_Detail.objects.filter(id_field=id_field,src=src,dest=language_obj,text=text)
#         if lang_detail_query.exclude(value='').count()>0:# complete translation exists
#             lang_detail_obj=lang_detail_query[0]
#         elif lang_detail_query.count()>0:
#             #only translation needed and update language detail one field
#             try:
#                 translated = GoogleTranslator(source=src, target=dest).translate(text)
#                 #translated=translator.translate(text, dest=dest, src=src).text
#             except Exception as e:
#                 translated=''
#                 m=e
#             lang_detail_obj=lang_detail_query[0]
#             lang_detail_obj.value=translated
#         else:
#             # print("insert")
#             try:
#                 # translated=translator.translate(text, dest=dest, src=src).text 
#                 translated = GoogleTranslator(source=src, target=dest).translate(text)
#             except Exception as e:
#                 translated=''
#                 m=e
        
#         # return Response(data={'language_obj':lang_detail_obj.value,'text':text,'translated':translated})
#         try:
#             lang_detail_obj.save()
#             m="Ok"
#         except Exception as e:
#             m=e
#             pass
#     return Response(data=data)