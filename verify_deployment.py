#!/usr/bin/env python3
"""
🔍 Pre-deployment verification script for AgroAnalytics
Run this before deploying to production
"""

import os
import sys
import json
import subprocess
from pathlib import Path

class Colors:
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    END = '\033[0m'

def print_header(text):
    print(f"\n{Colors.BLUE}{'='*50}{Colors.END}")
    print(f"{Colors.BLUE}{text}{Colors.END}")
    print(f"{Colors.BLUE}{'='*50}{Colors.END}\n")

def check_pass(message):
    print(f"{Colors.GREEN}✓{Colors.END} {message}")

def check_fail(message):
    print(f"{Colors.RED}✗{Colors.END} {message}")

def check_warn(message):
    print(f"{Colors.YELLOW}⚠{Colors.END} {message}")

def verify_file_exists(path, name):
    if Path(path).exists():
        check_pass(f"{name} exists")
        return True
    else:
        check_fail(f"{name} missing: {path}")
        return False

def verify_backend():
    print_header("🔧 Backend Verification")
    
    passed = 0
    failed = 0
    
    # Check Python files
    if verify_file_exists("backend/main.py", "main.py"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("backend/models.py", "models.py"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("backend/auth.py", "auth.py"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("backend/requirements.txt", "requirements.txt"):
        passed += 1
    else:
        failed += 1
    
    # Check routers
    if verify_file_exists("backend/routers/auth.py", "Auth router"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("backend/routers/collectes.py", "Collectes router"):
        passed += 1
    else:
        failed += 1
    
    # Check environment variables
    if os.getenv("SECRET_KEY"):
        check_pass("SECRET_KEY is set")
        passed += 1
    else:
        check_warn("SECRET_KEY not set (required for production)")
    
    if os.getenv("DATABASE_URL"):
        check_pass("DATABASE_URL is set")
        passed += 1
    else:
        check_warn("DATABASE_URL not set (will use SQLite)")
    
    # Security checks
    print("\n--- Security Checks ---")
    main_content = Path("backend/main.py").read_text()
    
    if '"*"' in main_content and 'allow_origins' in main_content:
        check_warn("CORS is set to wildcard '*' - should be restricted in production")
    else:
        check_pass("CORS properly configured")
        passed += 1
    
    # Database checks
    print("\n--- Database Checks ---")
    if verify_file_exists("database/init.sql", "Database init script"):
        passed += 1
    else:
        failed += 1
    
    return passed, failed

def verify_frontend():
    print_header("⚛️  Frontend Verification")
    
    passed = 0
    failed = 0
    
    # Check key files
    if verify_file_exists("frontend/package.json", "package.json"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("frontend/vite.config.js", "vite.config.js"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("frontend/src/App.jsx", "App.jsx"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("frontend/src/main.jsx", "main.jsx"):
        passed += 1
    else:
        failed += 1
    
    # Check components
    components = [
        "frontend/src/components/Login.jsx",
        "frontend/src/components/Accueil.jsx",
        "frontend/src/components/Dashboard.jsx",
        "frontend/src/components/ListeCollectes.jsx",
    ]
    
    for comp in components:
        if verify_file_exists(comp, f"{Path(comp).name}"):
            passed += 1
        else:
            failed += 1
    
    # Check context
    if verify_file_exists("frontend/src/context/AuthContext.jsx", "AuthContext"):
        passed += 1
    else:
        failed += 1
    
    # Check API configuration
    print("\n--- API Configuration ---")
    api_content = Path("frontend/src/api.js").read_text() if Path("frontend/src/api.js").exists() else ""
    
    if "axios" in api_content or "fetch" in api_content:
        check_pass("API client configured")
        passed += 1
    else:
        check_warn("API client might not be properly configured")
    
    return passed, failed

def verify_dependencies():
    print_header("📦 Dependency Verification")
    
    passed = 0
    failed = 0
    
    # Check backend dependencies
    print("--- Backend Dependencies ---")
    try:
        with open("backend/requirements.txt", "r") as f:
            requirements = f.read()
        
        required = ["fastapi", "uvicorn", "sqlalchemy", "pydantic", "python-jose"]
        for req in required:
            if req in requirements:
                check_pass(f"{req} is listed")
                passed += 1
            else:
                check_fail(f"{req} is missing")
                failed += 1
    except:
        check_fail("Could not read requirements.txt")
        failed += 1
    
    # Check frontend dependencies
    print("\n--- Frontend Dependencies ---")
    try:
        with open("frontend/package.json", "r") as f:
            package_json = json.load(f)
        
        required = ["react", "react-router-dom", "axios", "tailwindcss"]
        for req in required:
            if req in package_json.get("dependencies", {}) or req in package_json.get("devDependencies", {}):
                check_pass(f"{req} is listed")
                passed += 1
            else:
                check_fail(f"{req} is missing")
                failed += 1
    except Exception as e:
        check_fail(f"Could not read package.json: {e}")
        failed += 1
    
    return passed, failed

def verify_git():
    print_header("📂 Git Verification")
    
    passed = 0
    failed = 0
    
    # Check git status
    try:
        result = subprocess.run(["git", "status", "--porcelain"], capture_output=True, text=True, cwd=".")
        
        if result.returncode == 0:
            check_pass("Git repository initialized")
            passed += 1
            
            if result.stdout.strip():
                check_warn(f"Uncommitted changes detected:\n{result.stdout}")
            else:
                check_pass("Working directory is clean")
                passed += 1
        else:
            check_fail("Not a git repository")
            failed += 1
    except:
        check_warn("Git not found or not installed")
    
    # Check remote
    try:
        result = subprocess.run(["git", "remote", "-v"], capture_output=True, text=True, cwd=".")
        if "github.com" in result.stdout:
            check_pass("GitHub remote configured")
            passed += 1
        else:
            check_warn("GitHub remote not found")
    except:
        pass
    
    return passed, failed

def verify_deployment_config():
    print_header("🚀 Deployment Configuration")
    
    passed = 0
    failed = 0
    
    # Check deployment files
    if verify_file_exists("DEPLOYMENT_GUIDE.md", "Deployment Guide"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists(".github/workflows/deploy.yml", "GitHub Actions workflow"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("backend/render.yaml", "Render config"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("frontend/vercel.json", "Vercel config"):
        passed += 1
    else:
        failed += 1
    
    if verify_file_exists("deploy.sh", "Deploy script"):
        passed += 1
    else:
        failed += 1
    
    return passed, failed

def main():
    print(f"\n{Colors.BLUE}🔍 AgroAnalytics Pre-Deployment Verification{Colors.END}\n")
    
    total_passed = 0
    total_failed = 0
    
    # Run all checks
    p, f = verify_backend()
    total_passed += p
    total_failed += f
    
    p, f = verify_frontend()
    total_passed += p
    total_failed += f
    
    p, f = verify_dependencies()
    total_passed += p
    total_failed += f
    
    p, f = verify_git()
    total_passed += p
    total_failed += f
    
    p, f = verify_deployment_config()
    total_passed += p
    total_failed += f
    
    # Summary
    print_header("📊 Summary")
    print(f"{Colors.GREEN}✓ Passed: {total_passed}{Colors.END}")
    print(f"{Colors.RED}✗ Failed: {total_failed}{Colors.END}")
    
    if total_failed == 0:
        print(f"\n{Colors.GREEN}✅ All checks passed! Ready for deployment.{Colors.END}\n")
        return 0
    else:
        print(f"\n{Colors.RED}⚠️  Fix the failed checks before deploying.{Colors.END}\n")
        return 1

if __name__ == "__main__":
    sys.exit(main())
