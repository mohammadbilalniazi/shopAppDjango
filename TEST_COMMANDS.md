# Quick Test Commands

## Run all tests
python manage.py test

## Run tests for specific app
python manage.py test configuration.tests
python manage.py test user.tests
python manage.py test product.tests
python manage.py test bill.tests
python manage.py test asset.tests

## Run specific test case
python manage.py test configuration.tests.OrganizationModelTestCase

## Run specific test method
python manage.py test configuration.tests.OrganizationModelTestCase.test_create_organization

## Run with verbose output
python manage.py test --verbosity=2

## Keep test database between runs (faster)
python manage.py test --keepdb

## Run tests in parallel (faster for large test suites)
python manage.py test --parallel

## Generate coverage report
coverage run --source='.' manage.py test
coverage report
coverage html

## Run specific test pattern
python manage.py test --pattern="*_tests.py"

## Run tests and stop on first failure
python manage.py test --failfast

## Show test execution time
python manage.py test --timing
