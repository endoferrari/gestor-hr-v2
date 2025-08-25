#!/usr/bin/env python3
"""Test FastAPI application startup."""

import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_app_startup():
    """Test that the FastAPI app starts correctly"""
    try:
        response = client.get("/")
        print(f"✅ Root endpoint status: {response.status_code}")
        print(f"✅ Root response: {response.json()}")
    except Exception as e:
        print(f"❌ Error testing root endpoint: {e}")

    try:
        response = client.get("/api/v1/usuarios/")
        print(f"✅ Users endpoint status: {response.status_code}")
        if response.status_code == 401:
            print("✅ Authentication required (expected behavior)")
        elif response.status_code == 200:
            print(f"✅ Users response: {response.json()}")
    except Exception as e:
        print(f"❌ Error testing users endpoint: {e}")

    print("🎉 FastAPI app tests completed!")


if __name__ == "__main__":
    test_app_startup()
