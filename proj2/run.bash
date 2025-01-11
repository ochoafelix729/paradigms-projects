#!/bin/bash
set -e

echo off
javac Main.java View.java Controller.java
if %errorlevel% neq 0 (
    echo Compilation failed.
    pause
    exit /b %errorlevel%
)
java Main
pause
