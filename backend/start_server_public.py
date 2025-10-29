"""
Start the backend server with ngrok tunnel for public access
This allows the mobile app to connect from anywhere!
"""
import subprocess
import sys
import time
import json
import os

def check_ngrok_installed():
    """Check if ngrok is installed"""
    try:
        result = subprocess.run(['ngrok', 'version'], 
                              capture_output=True, 
                              text=True)
        return result.returncode == 0
    except FileNotFoundError:
        return False

def install_ngrok():
    """Instructions to install ngrok"""
    print("❌ Ngrok is not installed!")
    print("\nPlease install ngrok:")
    print("\n📥 Option 1: Using npm (Recommended)")
    print("   npm install -g ngrok")
    print("\n📥 Option 2: Download from ngrok.com")
    print("   https://ngrok.com/download")
    print("\n📥 Option 3: Using chocolatey (Windows)")
    print("   choco install ngrok")
    print("\nAfter installing, run this script again.")
    sys.exit(1)

def start_ngrok(port=8000):
    """Start ngrok tunnel"""
    print("\n🔧 Starting ngrok tunnel...")
    print(f"   Creating public URL for localhost:{port}")
    
    # Start ngrok in background
    process = subprocess.Popen(
        ['ngrok', 'http', str(port), '--log=stdout'],
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        text=True
    )
    
    # Wait for ngrok to start
    print("   Waiting for ngrok to initialize...")
    time.sleep(3)
    
    # Get ngrok URL
    try:
        import requests
        response = requests.get('http://localhost:4040/api/tunnels')
        data = response.json()
        
        if data['tunnels']:
            public_url = data['tunnels'][0]['public_url']
            print(f"\n✅ Ngrok tunnel created!")
            print(f"\n🌐 PUBLIC URL: {public_url}")
            print(f"\n📱 Use this URL in your mobile app:")
            print(f"   Settings → Server URL → {public_url}")
            print(f"\n⚠️  This URL is PUBLIC and accessible from anywhere!")
            print(f"   Keep this terminal window open.")
            return process, public_url
    except Exception as e:
        print(f"⚠️  Could not retrieve ngrok URL: {e}")
        print("   Check http://localhost:4040 for ngrok dashboard")
    
    return process, None

def start_backend_server():
    """Start the FastAPI backend server"""
    print("\n🚀 Starting FastAPI backend server...")
    
    # Start server
    process = subprocess.Popen(
        [sys.executable, 'server.py'],
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    
    # Monitor output
    print("\n📡 Server output:")
    return process

def main():
    print("=" * 60)
    print("🌐 Driver Monitoring System - PUBLIC ACCESS MODE")
    print("=" * 60)
    print("\nThis script will:")
    print("1. Start the backend server on your computer")
    print("2. Create a public URL using ngrok")
    print("3. Allow your mobile app to connect from anywhere!")
    print("\n⚠️  WARNING: Your server will be publicly accessible!")
    print("   Only use this for testing or with proper security.")
    print("\n")
    
    # Check ngrok
    if not check_ngrok_installed():
        install_ngrok()
    
    print("✅ Ngrok is installed!")
    
    # Start ngrok tunnel first
    ngrok_process, public_url = start_ngrok(8000)
    
    if not ngrok_process:
        print("❌ Failed to start ngrok tunnel")
        sys.exit(1)
    
    # Start backend server
    server_process = start_backend_server()
    
    print("\n" + "=" * 60)
    print("✅ SYSTEM READY!")
    print("=" * 60)
    
    if public_url:
        print(f"\n🌐 PUBLIC URL: {public_url}")
        print(f"\n📱 Mobile App Setup:")
        print(f"   1. Open Driver Monitor app on your phone")
        print(f"   2. Go to Settings")
        print(f"   3. Enter Server URL: {public_url}")
        print(f"   4. Test Connection")
        print(f"   5. Start Monitoring!")
        print(f"\n🔗 Ngrok Dashboard: http://localhost:4040")
    
    print("\n⏹️  Press Ctrl+C to stop both servers")
    
    try:
        # Keep processes running
        while True:
            # Check if processes are still alive
            if server_process.poll() is not None:
                print("\n❌ Backend server stopped!")
                break
            if ngrok_process.poll() is not None:
                print("\n❌ Ngrok tunnel stopped!")
                break
            
            # Print server output
            line = server_process.stdout.readline()
            if line:
                print(line, end='')
            
            time.sleep(0.1)
    
    except KeyboardInterrupt:
        print("\n\n⏹️  Shutting down...")
    
    finally:
        # Cleanup
        print("   Stopping ngrok tunnel...")
        ngrok_process.terminate()
        
        print("   Stopping backend server...")
        server_process.terminate()
        
        print("✅ Cleanup complete!")

if __name__ == "__main__":
    main()





