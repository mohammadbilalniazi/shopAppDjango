def delete_file(obj,file_field,message=None):
    def is_file_exists(file_obj):
            return bool(file_obj.name) and file_obj.storage.exists(file_obj.name)
    if is_file_exists(getattr(obj,file_field)):
        import pathlib
        from django.conf import settings
        import os
        file_to_be_deleted=getattr(obj,file_field)     
        complete_path=pathlib.PurePath(settings.MEDIA_ROOT,pathlib.Path(file_to_be_deleted.name))
        if os.path.exists(complete_path):  
            os.remove(complete_path)
            message="{} successfully deleted".format(complete_path)
            ok=True
        else:
            messag="{} not exists".format(complete_path)
            ok=False
    else:
        message="{} not exists".format(getattr(obj,file_field).name)
        ok=False
    return (ok,message)
