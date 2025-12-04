from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.sessions.models import Session
from django.contrib.auth.models import User
from django.contrib import messages
from django.utils import timezone
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.core.paginator import Paginator
from django.db.models import Q
import json
from datetime import datetime, timedelta


@login_required(login_url='/')
def session_management(request):
    """View for managing user sessions"""
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to access session management.')
        return redirect('admin:index')
    
    # Get all active sessions
    sessions = Session.objects.all().order_by('-expire_date')
    
    # Get session data with user information
    session_data = []
    for session in sessions:
        session_dict = session.get_decoded()
        user_id = session_dict.get('_auth_user_id')
        
        user_info = None
        if user_id:
            try:
                user = User.objects.get(id=user_id)
                user_info = {
                    'username': user.username,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'email': user.email,
                    'is_active': user.is_active,
                    'last_login': user.last_login
                }
            except User.DoesNotExist:
                pass
        
        session_data.append({
            'session_key': session.session_key,
            'expire_date': session.expire_date,
            'user_info': user_info,
            'is_expired': session.expire_date < timezone.now(),
            'session_data': session_dict
        })
    
    # Apply search filter if provided
    search_query = request.GET.get('search', '')
    if search_query:
        session_data = [
            s for s in session_data 
            if (s['user_info'] and (
                search_query.lower() in s['user_info']['username'].lower() or
                search_query.lower() in (s['user_info']['first_name'] or '').lower() or
                search_query.lower() in (s['user_info']['last_name'] or '').lower()
            )) or search_query in s['session_key']
        ]
    
    # Pagination
    paginator = Paginator(session_data, 20)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)
    
    context = {
        'sessions': page_obj,
        'search_query': search_query,
        'total_sessions': len(session_data),
        'active_sessions': len([s for s in session_data if not s['is_expired']])
    }
    
    return render(request, 'user/session_management.html', context)


@login_required(login_url='/')
@csrf_exempt
def delete_session(request, session_key):
    """Delete a specific session"""
    if not request.user.is_superuser:
        return JsonResponse({'ok': False, 'message': 'Permission denied'})
    
    try:
        session = Session.objects.get(session_key=session_key)
        session.delete()
        messages.success(request, f'Session {session_key} deleted successfully.')
        return JsonResponse({'ok': True, 'message': 'Session deleted successfully'})
    except Session.DoesNotExist:
        return JsonResponse({'ok': False, 'message': 'Session not found'})
    except Exception as e:
        return JsonResponse({'ok': False, 'message': str(e)})


@login_required(login_url='/')
@csrf_exempt
def clear_expired_sessions(request):
    """Clear all expired sessions"""
    if not request.user.is_superuser:
        return JsonResponse({'ok': False, 'message': 'Permission denied'})
    
    try:
        expired_count = Session.objects.filter(expire_date__lt=timezone.now()).count()
        Session.objects.filter(expire_date__lt=timezone.now()).delete()
        
        messages.success(request, f'{expired_count} expired sessions cleared successfully.')
        return JsonResponse({'ok': True, 'message': f'{expired_count} expired sessions cleared'})
    except Exception as e:
        return JsonResponse({'ok': False, 'message': str(e)})


@api_view(['POST'])
def get_session_details(request):
    """Get detailed session information"""
    if not request.user.is_superuser:
        return Response({'ok': False, 'message': 'Permission denied'})
    
    session_key = request.data.get('session_key')
    
    try:
        session = Session.objects.get(session_key=session_key)
        session_data = session.get_decoded()
        
        return Response({
            'ok': True,
            'session_key': session.session_key,
            'expire_date': session.expire_date,
            'session_data': session_data
        })
    except Session.DoesNotExist:
        return Response({'ok': False, 'message': 'Session not found'})
    except Exception as e:
        return Response({'ok': False, 'message': str(e)})