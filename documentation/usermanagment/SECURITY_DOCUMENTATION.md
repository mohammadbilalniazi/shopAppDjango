Security Documentation

1. Purpose

This document describes the main security controls implemented in the supermarket electronic management system and identifies important security gaps visible in the current codebase.

It is intended for thesis use in the system security, risk analysis, and implementation chapters.

Primary source files used for this analysis:
- shop/settings.py
- shop/urls.py
- common/organization.py
- configuration/views_branch.py
- user/views_login.py
- user/views_session.py
- bill/views_stripe.py
- configuration/models.py
- product/models.py

2. Security Architecture Overview

The system applies security mainly at these layers:
- Django middleware security layer
- Authentication with Django session login
- Authorization through organization-aware access checks
- Webhook verification for Stripe callbacks
- Data validation in models and views
- Transaction safety using database atomic operations
- Auditability through transaction and webhook logs

3. Middleware And Framework-Level Protections

From shop/settings.py:

```python
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]
```

Security impact:
- SecurityMiddleware enables Django security hardening features.
- CsrfViewMiddleware provides CSRF protection for standard browser requests.
- AuthenticationMiddleware binds authenticated user identity to the request.
- XFrameOptionsMiddleware helps reduce clickjacking risk.

4. Authentication Controls

User login is performed through Django authentication and session login.

From user/views_login.py:

```python
def submit(request):
    data=json.loads(request.body.decode("utf-8"))
    username=str(data['username'])
    password=str(data['password'])

    user=authenticate(request,username=username,password=password)
    if user is not None:
        login(request,user)
        status=http_status.HTTP_200_OK
    else:
        status=http_status.HTTP_401_UNAUTHORIZED
```

Security observations:
- Authentication relies on Django's built-in password verification.
- Successful login creates a Django-authenticated session.
- Failed authentication returns HTTP 401.

Password policy

From shop/settings.py:

```python
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]
```

Security impact:
- Weak and predictable passwords are partially restricted.
- Passwords similar to user attributes are discouraged.

5. Authorization And Multi-Tenant Access Control

The system is multi-organization. Authorization decisions are enforced using organization membership and role checks.

Organization access helper

From common/organization.py:

```python
def find_userorganization(request, organization_id=None):
    if organization_id is not None and organization_id != '' and organization_id != 'all':
        user_orgs = OrganizationUser.objects.filter(organization_id=organization_id)
    elif request.user.is_superuser:
        user_orgs = OrganizationUser.objects.all()
    else:
        user_orgs = OrganizationUser.objects.filter(user=request.user)

    orgs = Organization.objects.filter(id__in=user_orgs.values_list("organization_id", flat=True))
    if orgs.count() == 1:
        organization = orgs.first()
    else:
        organization = None
    return organization, orgs
```

Security role of this helper:
- Restricts business data by organization membership.
- Supports superuser override.
- Acts as a shared authorization primitive used by billing, product, stock, and configuration features.

Branch administration permission control

From configuration/views_branch.py:

```python
def check_admin_permission(user, organization):
    if organization.owner == user:
        return True
    if user.is_superuser:
        return True
    try:
        org_user = OrganizationUser.objects.get(user=user, organization=organization)
        return org_user.role in ['admin', 'superuser', 'owner']
    except OrganizationUser.DoesNotExist:
        return False
```

Security impact:
- Prevents unauthorized users from branch CRUD operations.
- Distinguishes organization owner, admin, and superuser privileges.

6. Payment Security And Stripe Webhook Verification

Stripe online payments are one of the most security-sensitive parts of the system.

Secret loading from environment variables

From shop/settings.py:

```python
STRIPE_PUBLISHABLE_KEY = os.getenv('STRIPE_PUBLISHABLE_KEY', '')
STRIPE_SECRET_KEY = os.getenv('STRIPE_SECRET_KEY', '')
STRIPE_WEBHOOK_SECRET = os.getenv('STRIPE_WEBHOOK_SECRET', '')
```

Signed webhook verification

From bill/views_stripe.py:

```python
@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    webhook_secret = getattr(settings, 'STRIPE_WEBHOOK_SECRET', '')

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)
```

Security impact:
- The endpoint is exempt from CSRF because Stripe is an external caller.
- Authenticity is enforced through Stripe signature verification.
- Invalid payloads and invalid signatures are rejected with HTTP 400.

Organization-based payment authorization

From bill/views_stripe.py:

```python
if not request.user.is_superuser:
    if self_organization:
        if bill.organization != self_organization:
            return Response({'ok': False, 'message': 'You do not have permission to pay this bill'}, status=403)
    elif user_orgs:
        if bill.organization not in user_orgs:
            return Response({'ok': False, 'message': 'You do not have permission to pay this bill'}, status=403)
```

Security impact:
- Prevents a logged-in user from paying or refunding a bill outside their organization.

7. Session Security And Administrative Session Control

From user/views_session.py:

```python
@login_required(login_url='/')
def session_management(request):
    if not request.user.is_superuser:
        messages.error(request, 'You need superuser permissions to access session management.')
        return redirect('admin:index')
```

Administrative session actions are restricted to superusers only.

Additional protected operations:
- delete_session
- clear_expired_sessions
- get_session_details

Security impact:
- Reduces exposure of session metadata to ordinary users.
- Supports incident response by allowing privileged session invalidation.

8. Input Validation And Data Integrity Controls

Model constraints

Examples from configuration/models.py:

```python
img = models.FileField(
    upload_to="Organization",
    validators=[FileExtensionValidator(allowed_extensions=['jpg', 'png', 'jpeg'])],
    null=True,
    blank=True
)
```

```python
dob = models.CharField(
    max_length=10,
    validators=[
        RegexValidator(
            regex=r'^\d{4}-\d{2}-\d{2}$',
            message='Date of Birth must be in YYYY-MM-DD format',
        )
    ]
)
```

Examples of database integrity constraints:
- unique organization names
- unique branch name and code per organization
- unique user-to-organization mapping
- unique stock rows per organization, product, and branch

Business-rule validation in inventory

From product/models.py:

```python
def clean(self):
    if self.branch and self.organization and self.branch.organization != self.organization:
        raise ValidationError("Selected branch does not belong to the selected organization.")
```

Security impact:
- Prevents inconsistent cross-organization inventory association.

Transaction safety

Critical mutation endpoints use database transactions.

Example from bill/views_stripe.py:

```python
@login_required
@api_view(['POST'])
@transaction.atomic
def refund_payment(request, payment_id):
```

This reduces the risk of partial writes during billing and refund operations.

9. Audit Logging And Traceability

The system records security-relevant payment activity through transaction and webhook logs.

From bill/views_stripe.py:

```python
TransactionLog.objects.create(
    bill=bill,
    organization=organization,
    user=user,
    source=source,
    event_type=event_type,
    status=status_value,
    reference_id=reference_id,
    metadata=metadata or {},
)
```

Also, Stripe webhook events are stored in the StripeWebhookEvent table.

Security value:
- Supports audit trails.
- Helps investigate fraud, payment failures, and webhook replay issues.
- Preserves external event evidence in the database.

10. Security Weaknesses Identified In Current Code

The current codebase includes important protections, but several weaknesses remain.

10.1 Configuration weaknesses

Observed in shop/settings.py:
- DEBUG defaults to True when environment variables are missing.
- SECRET_KEY uses a fallback default value.
- Database credentials are currently embedded in settings.
- Email credentials include environment fallbacks.

Security risk:
- Production deployments may run with unsafe defaults.
- Hardcoded or fallback secrets increase credential exposure risk.

10.2 CSRF exemptions require careful review

Some endpoints are marked with csrf_exempt, including:
- Stripe webhook, which is justified because Stripe is external
- session deletion and session cleanup views, which should be reviewed carefully if they are called from browser contexts

Security risk:
- CSRF-exempt browser-accessible endpoints can become attack surfaces if not protected by stronger request-origin controls.

10.3 Sensitive debug output

Observed in multiple files:
- request bodies are printed in login flow
- authentication details are printed
- exception details are printed directly

Security risk:
- Logs may unintentionally store usernames, passwords, request payloads, or internal identifiers.

10.4 Upload validation is partial

The system validates some file extensions and image shape/size logic, but it does not consistently enforce:
- MIME type verification
- malware scanning
- secure random renaming
- uniform upload size limits

10.5 Missing explicit rate limiting

No login throttling or API rate limiting is visible in the reviewed code.

Security risk:
- Brute-force login attempts and abusive API traffic are harder to control.

11. Security Recommendations

For thesis recommendations and future work, the following improvements are appropriate:

1. Remove all hardcoded credentials and require environment-only secrets in production.
2. Set DEBUG to False by default and enable it only in explicit development environments.
3. Replace print-based logging with structured logging that redacts sensitive values.
4. Review csrf_exempt endpoints and keep exemptions only where external callback verification exists.
5. Add login throttling and API rate limiting.
6. Add secure cookie settings such as HTTPS-only session and CSRF cookies for production.
7. Add stronger upload validation including MIME inspection and stricter file size checks.
8. Add automated security tests for authorization boundaries, webhook signature failures, and refund misuse.

12. Thesis Discussion Summary

This project demonstrates a practical security design for a business web application:
- authentication is delegated to Django's proven auth system
- authorization is implemented through organization and role membership
- sensitive payment flows are protected by Stripe signature verification and audit logs
- data consistency is supported by validation rules and atomic transactions

At the same time, the codebase also illustrates common real-world weaknesses in academic and startup systems:
- insecure defaults in configuration
- debug logging of sensitive data
- uneven CSRF and upload hardening
- lack of traffic throttling

That combination makes the project suitable for thesis analysis because it shows both implemented protections and realistic areas for future security improvement.
