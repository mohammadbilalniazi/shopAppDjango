# from django.shortcuts import render
# from django.http import HttpResponse
# import pyqrcode
# import png
# from pyqrcode import QRCode
# import cv2,webbrowser


# from django.shortcuts import render
# from django.http import HttpResponse,StreamingHttpResponse,HttpResponseServerError
# import time
# from django.views.decorators.gzip import gzip_page

# class VideoCamera(object):
#     def __init__(self):
#         self.video = cv2.VideoCapture(0)
#     def __del__(self):
#         self.video.release()

#     def get_frame(self):
#         ret,image = self.video.read()
#         ret,jpeg = cv2.imencode('.jpg',image)
#         return jpeg.tobytes()

# def gen(camera):
#     while True:
#         frame = camera.get_frame()
#         yield(b'--frame\r\n'
#         b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

# @gzip_page
# def qr_reader(request): 
#     try:
#         return StreamingHttpResponse(gen(VideoCamera()),content_type="multipart/x-mixed-replace;boundary=frame")
#     except HttpResponseServerError as e:
#         print("aborted")


# def qr_generater(request):
#     link='www.wikipedia.com'
#     url=pyqrcode.create(link)
#     url.png('wikipediaqrcode.png',scale=6)
#     return HttpResponse(url)

# def qr_reader2(request):
#     cap=cv2.VideoCapture(0)
#     detector=cv2.QRCodeDetector()
#     while True:
#         ret,img=cap.read()
#         if ret:
#             data,one,_=detector.detectAndDecode(img)
#             if data:
#                 a=data
#                 print(a)
#                 break
#             cv2.imshow('qrcodescanner',img)
#             if cv2.waitKey(1)==ord('q'):
#                 break
        
#     b=webbrowser.open(str(a))
#     cap.release()
#     cv2.destroyAllWindows()
#     return HttpResponse("code completed")

# def qr_reader2(request):
#     import cv2
#     # Name of the QR Code Image file
#     filename = "tejaratistan.jpg"
#     # read the QRCODE image
#     image = cv2.imread(filename)
#     # initialize the cv2 QRCode detector
#     detector = cv2.QRCodeDetector()
#     # detect and decode
#     data, vertices_array, binary_qrcode = detector.detectAndDecode(image)
#     # if there is a QR code
#     # print the data
#     if vertices_array is not None:
#         print("QRCode data:")
#         print(data)
#     else:
#         print("There was some error") 
#     cv2.destroyAllWindows()
            
#     return HttpResponse("stopped")
    
