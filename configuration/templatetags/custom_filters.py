from django import template

register = template.Library()

@register.filter
def get_item(dictionary, key):
    """Get an item from a dict safely."""
    if dictionary is None:
        return None
    return dictionary.get(key)

@register.filter
def get_attr(obj, attr_name):
    """Get attribute safely from an object or dict."""
    if not obj:
        return ""
    return getattr(obj, attr_name, "")
