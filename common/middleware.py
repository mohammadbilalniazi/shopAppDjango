"""
Custom middleware for the shop project.
"""


class EmbedFrameOptionsMiddleware:
    """
    Allow pages requested with ``?embed=1`` to be framed by our own pages.

    The project's default X-Frame-Options is DENY, which blocks the
    Financial Reports page from showing each report inside a tab's <iframe>.
    For embed requests we relax it to SAMEORIGIN (same-origin framing only),
    which keeps clickjacking protection against other sites intact.
    """

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        response = self.get_response(request)
        if request.GET.get('embed') == '1':
            response['X-Frame-Options'] = 'SAMEORIGIN'
        return response
