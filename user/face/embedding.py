# import cv2
# import numpy as np
# from insightface.app import FaceAnalysis


# from django.views.decorators.csrf import csrf_exempt
# from django.http import JsonResponse
# import base64
# from user.models import UserFace

# app = FaceAnalysis(name='buffalo_l')  # lightweight
# app.prepare(ctx_id=0)

# def get_embedding(image_bytes):
#     nparr = np.frombuffer(image_bytes, np.uint8)
#     img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

#     faces = app.get(img)
#     if len(faces) == 0:
#         return None

#     return faces[0].embedding.tolist()

# @csrf_exempt
# def save_face(request):
#     user = request.user

#     image_base64 = request.POST.get("image")
#     image_bytes = base64.b64decode(image_base64.split(',')[1])

#     embedding = get_embedding(image_bytes)

#     if embedding is None:
#         return JsonResponse({"status": 400, "message": "No face detected"})

#     UserFace.objects.update_or_create(
#         user=user,
#         defaults={"embedding": embedding}
#     )

#     return JsonResponse({"status": 200, "message": "Face saved"})