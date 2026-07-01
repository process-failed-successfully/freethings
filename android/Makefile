.PHONY: help list-profiles create-emulator start-emulator stop-emulator run test build clean

# Direct SDK tool paths — bypasses the android CLI wrapper for speed
ANDROID_HOME  ?= $(HOME)/Android/Sdk
ADB           := $(ANDROID_HOME)/platform-tools/adb
EMULATOR      := $(ANDROID_HOME)/emulator/emulator

APP_ID        := com.example.freethingsreader
MAIN_ACTIVITY := $(APP_ID)/.MainActivity
DEBUG_APK     := app/build/outputs/apk/debug/app-debug.apk

AVD_NAME      := medium_phone

help:
	@echo "Available commands:"
	@echo "  make list-profiles    - List available device profiles for emulators"
	@echo "  make create-emulator  - Create the default emulator ($(AVD_NAME))"
	@echo "  make start-emulator   - Start the emulated device ($(AVD_NAME))"
	@echo "  make stop-emulator    - Stop the emulated device ($(AVD_NAME))"
	@echo "  make run              - Build, install and launch the app on the active device/emulator"
	@echo "  make test             - Run unit tests"
	@echo "  make build            - Compile debug APK"
	@echo "  make clean            - Clean Gradle build outputs"

# One-time setup — android CLI is fine here
list-profiles:
	android emulator create --list-profiles

create-emulator:
	android emulator create $(AVD_NAME)

# Hot path: direct native binaries, no JVM overhead
start-emulator:
	@echo "Starting emulator '$(AVD_NAME)'..."
	@nohup $(EMULATOR) -avd $(AVD_NAME) >/dev/null 2>&1 &
	@echo "Waiting for emulator to come online..."
	@until $(ADB) devices | grep -q "emulator.*device$$"; do sleep 1; done
	@$(ADB) shell 'while [ -z "$$(getprop sys.boot_completed)" ]; do sleep 1; done'
	@echo "Emulator ready ✓"

stop-emulator:
	@$(ADB) emu kill 2>/dev/null || true
	@until ! $(ADB) devices | grep -q "emulator"; do sleep 1; done
	@echo "Emulator stopped ✓"

run: build
	@echo "Installing..."
	@$(ADB) install -r $(DEBUG_APK)
	@echo "Launching..."
	@$(ADB) shell am start -n $(MAIN_ACTIVITY)

test:
	./gradlew test

build:
	./gradlew assembleDebug

clean:
	./gradlew clean
