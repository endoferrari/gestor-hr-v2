#!/usr/bin/env python3
"""Test imports for security packages."""

try:
    from jose import JWTError, jwt

    print("✅ jose imports successful")
except ImportError as e:
    print(f"❌ jose import failed: {e}")

try:
    from passlib.context import CryptContext

    print("✅ passlib imports successful")
except ImportError as e:
    print(f"❌ passlib import failed: {e}")

print("Security import test completed")
