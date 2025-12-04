"""
Management command for branch-related operations
"""
from django.core.management.base import BaseCommand, CommandError
from django.contrib.auth.models import User
from configuration.models import Organization, Branch
from user.models import OrganizationUser
from common.branch_utils import BranchManager


class Command(BaseCommand):
    help = 'Manage branch assignments and operations'

    def add_arguments(self, parser):
        subparsers = parser.add_subparsers(dest='action', help='Available actions')
        
        # Assign user to branch
        assign_parser = subparsers.add_parser('assign', help='Assign user to branch')
        assign_parser.add_argument('username', type=str, help='Username to assign')
        assign_parser.add_argument('organization_name', type=str, help='Organization name')
        assign_parser.add_argument('branch_name', type=str, help='Branch name')
        assign_parser.add_argument('--role', type=str, default='employee', help='User role (default: employee)')
        
        # List user branches
        list_parser = subparsers.add_parser('list-user-branches', help='List branches accessible to user')
        list_parser.add_argument('username', type=str, help='Username to check')
        list_parser.add_argument('--organization', type=str, help='Filter by organization name')
        
        # List branch users
        branch_users_parser = subparsers.add_parser('list-branch-users', help='List users in a branch')
        branch_users_parser.add_argument('organization_name', type=str, help='Organization name')
        branch_users_parser.add_argument('branch_name', type=str, help='Branch name')
        branch_users_parser.add_argument('--role', type=str, help='Filter by role')
        
        # Organization summary
        summary_parser = subparsers.add_parser('org-summary', help='Show organization branch summary')
        summary_parser.add_argument('organization_name', type=str, help='Organization name')
        
        # Clean up orphaned assignments
        cleanup_parser = subparsers.add_parser('cleanup', help='Clean up orphaned branch assignments')
        cleanup_parser.add_argument('--dry-run', action='store_true', help='Show what would be cleaned without making changes')

    def handle(self, *args, **options):
        action = options['action']
        
        if action == 'assign':
            self.assign_user_to_branch(options)
        elif action == 'list-user-branches':
            self.list_user_branches(options)
        elif action == 'list-branch-users':
            self.list_branch_users(options)
        elif action == 'org-summary':
            self.show_organization_summary(options)
        elif action == 'cleanup':
            self.cleanup_orphaned_assignments(options)
        else:
            self.print_help()

    def assign_user_to_branch(self, options):
        """Assign a user to a specific branch"""
        try:
            user = User.objects.get(username=options['username'])
            organization = Organization.objects.get(name=options['organization_name'])
            branch = Branch.objects.get(name=options['branch_name'], organization=organization)
            
            org_user = BranchManager.assign_user_to_branch(user, branch, options['role'])
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"✅ User '{user.username}' assigned to branch '{branch.name}' "
                    f"in organization '{organization.name}' with role '{options['role']}'"
                )
            )
            
        except User.DoesNotExist:
            raise CommandError(f"User '{options['username']}' not found")
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{options['organization_name']}' not found")
        except Branch.DoesNotExist:
            raise CommandError(f"Branch '{options['branch_name']}' not found in organization '{options['organization_name']}'")

    def list_user_branches(self, options):
        """List branches accessible to a user"""
        try:
            user = User.objects.get(username=options['username'])
            organization = None
            
            if options.get('organization'):
                organization = Organization.objects.get(name=options['organization'])
            
            branches = BranchManager.get_user_branches(user, organization)
            
            if branches.exists():
                self.stdout.write(f"\n🏢 Branches accessible to user '{user.username}':")
                for branch in branches:
                    org_user = OrganizationUser.objects.filter(
                        user=user, 
                        organization=branch.organization
                    ).first()
                    
                    access_type = "Specific assignment" if org_user and org_user.branch == branch else "Organization access"
                    role = org_user.role if org_user else "Unknown"
                    
                    self.stdout.write(
                        f"  • {branch.name} ({branch.organization.name}) - {role} - {access_type}"
                    )
            else:
                self.stdout.write(f"❌ No branches accessible to user '{user.username}'")
                
        except User.DoesNotExist:
            raise CommandError(f"User '{options['username']}' not found")
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{options['organization']}' not found")

    def list_branch_users(self, options):
        """List users in a specific branch"""
        try:
            organization = Organization.objects.get(name=options['organization_name'])
            branch = Branch.objects.get(name=options['branch_name'], organization=organization)
            
            users = BranchManager.get_branch_users(branch, options.get('role'))
            
            if users.exists():
                self.stdout.write(f"\n👥 Users in branch '{branch.name}':")
                for org_user in users:
                    access_type = "Specific" if org_user.branch == branch else "General"
                    self.stdout.write(
                        f"  • {org_user.user.username} ({org_user.user.get_full_name()}) - "
                        f"{org_user.role} - {access_type} access"
                    )
            else:
                role_filter = f" with role '{options.get('role')}'" if options.get('role') else ""
                self.stdout.write(f"❌ No users found in branch '{branch.name}'{role_filter}")
                
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{options['organization_name']}' not found")
        except Branch.DoesNotExist:
            raise CommandError(f"Branch '{options['branch_name']}' not found")

    def show_organization_summary(self, options):
        """Show organization branch summary"""
        try:
            organization = Organization.objects.get(name=options['organization_name'])
            summary = BranchManager.get_organization_branch_summary(organization)
            
            self.stdout.write(f"\n🏛️ Organization: {organization.name}")
            self.stdout.write(f"📊 Total Branches: {summary['total_branches']}")
            self.stdout.write(f"👥 Total Users: {summary['total_users']}")
            self.stdout.write(f"🎯 Users with specific branch assignments: {summary['users_with_specific_branches']}")
            self.stdout.write(f"🌐 Users with general access: {summary['users_with_general_access']}")
            
            if summary['branch_details']:
                self.stdout.write("\n🏢 Branch Details:")
                for branch_info in summary['branch_details']:
                    branch = branch_info['branch']
                    self.stdout.write(
                        f"  • {branch.name}: {branch_info['total_users']} users "
                        f"({branch_info['specific_users']} specific, {branch_info['general_users']} general)"
                    )
            
        except Organization.DoesNotExist:
            raise CommandError(f"Organization '{options['organization_name']}' not found")

    def cleanup_orphaned_assignments(self, options):
        """Clean up orphaned branch assignments"""
        dry_run = options.get('dry_run', False)
        
        # Find OrganizationUsers with inactive branches
        orphaned_assignments = OrganizationUser.objects.filter(
            branch__is_active=False
        ).exclude(branch__isnull=True)
        
        if orphaned_assignments.exists():
            self.stdout.write(f"\n🧹 Found {orphaned_assignments.count()} orphaned branch assignments:")
            
            for org_user in orphaned_assignments:
                self.stdout.write(
                    f"  • {org_user.user.username} -> {org_user.branch.name} (inactive branch)"
                )
                
                if not dry_run:
                    org_user.branch = None  # Remove branch assignment but keep org access
                    org_user.save()
                    self.stdout.write(f"    ✅ Cleaned up assignment for {org_user.user.username}")
            
            if dry_run:
                self.stdout.write("\n⚠️  This was a dry run. Use without --dry-run to make changes.")
            else:
                self.stdout.write(f"\n✅ Cleaned up {orphaned_assignments.count()} orphaned assignments")
        else:
            self.stdout.write("✅ No orphaned branch assignments found")

    def print_help(self):
        """Print usage help"""
        self.stdout.write("\n🔧 Branch Management Commands:")
        self.stdout.write("  assign <username> <org_name> <branch_name> [--role <role>]")
        self.stdout.write("  list-user-branches <username> [--organization <org_name>]")
        self.stdout.write("  list-branch-users <org_name> <branch_name> [--role <role>]")
        self.stdout.write("  org-summary <org_name>")
        self.stdout.write("  cleanup [--dry-run]")
        self.stdout.write("\nExamples:")
        self.stdout.write("  python manage.py manage_branches assign john 'Main Store' 'Downtown Branch' --role manager")
        self.stdout.write("  python manage.py manage_branches list-user-branches john")
        self.stdout.write("  python manage.py manage_branches org-summary 'Main Store'")