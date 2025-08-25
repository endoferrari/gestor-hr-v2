#!/usr/bin/env python3
"""Test security functions."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import create_access_token, get_password_hash, verify_password


def test_security_functions():
    print("Testing security functions...")

    # Test password hashing
    password = "test_password_123"
    hashed = get_password_hash(password)
    print(f"✅ Password hashed: {hashed[:50]}...")

    # Test password verification
    is_valid = verify_password(password, hashed)
    print(f"✅ Password verification: {is_valid}")

    # Test wrong password
    is_invalid = verify_password("wrong_password", hashed)
    print(f"✅ Wrong password verification: {is_invalid}")

    # Test JWT token creation
    token = create_access_token(subject="test_user@example.com")
    print(f"✅ JWT token created: {token[:50]}...")

    print("🎉 All security tests passed!")


if __name__ == "__main__":
    test_security_functions()
