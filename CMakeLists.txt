cmake_minimum_required(VERSION 3.22)

project(Obstacle VERSION 1.0.0)

# CMake 4.x normalizes install() DESTINATION paths; with this policy set,
# backslashes in -DOBSTACLE_VST3_DIR="C:\Users\...\VST3" are treated as
# literal path separators instead of invalid escapes ("\U" errors).
if(POLICY CMP0177)
    cmake_policy(SET CMP0177 NEW)
endif()

set(JUCE_DIR "C:/JUCE/JUCE" CACHE PATH "Path to the JUCE source tree")

add_subdirectory(${JUCE_DIR} JUCE EXCLUDE_FROM_ALL)

juce_add_plugin(Obstacle
    COMPANY_NAME "Retrokielto"
    PRODUCT_NAME "Obstacle"
    BUNDLE_ID "com.retrokielto.Obstacle"
    PLUGIN_MANUFACTURER_CODE Rtrk
    PLUGIN_CODE Obst
    FORMATS VST3 Standalone
    ICON_BIG "${CMAKE_CURRENT_SOURCE_DIR}/resources/icon-256.png"
    NEEDS_WEBVIEW2 TRUE
    COPY_PLUGIN_AFTER_BUILD FALSE
    NEEDS_MIDI_INPUT FALSE
    NEEDS_MIDI_OUTPUT FALSE
    IS_MIDI_EFFECT FALSE
    EDITOR_WANTS_KEYBOARD_FOCUS FALSE)

juce_generate_juce_header(Obstacle)

target_sources(Obstacle PRIVATE
    Source/PluginProcessor.cpp
    Source/PluginEditor.cpp
    Source/WebViewEditor.cpp)

target_include_directories(Obstacle PRIVATE
    ${CMAKE_CURRENT_BINARY_DIR})

target_compile_definitions(Obstacle PRIVATE
    JUCE_WEB_BROWSER=1
    JUCE_USE_WIN_WEBVIEW2=1
    JUCE_USE_CURL=0
    JUCE_IGNORE_VST3_MISMATCHED_PARAMETER_ID_WARNING=1)

target_link_libraries(Obstacle PRIVATE
    juce::juce_audio_basics
    juce::juce_audio_devices
    juce::juce_audio_formats
    juce::juce_audio_plugin_client
    juce::juce_audio_processors
    juce::juce_audio_utils
    juce::juce_core
    juce::juce_data_structures
    juce::juce_dsp
    juce::juce_events
    juce::juce_graphics
    juce::juce_gui_basics
    juce::juce_gui_extra)

# ==============================================================================
# Install rules
#
# After building, run from an *elevated* PowerShell so the install can write
# to Program Files:
#
#   cmake --build build --config Release --target INSTALL
#   # or equivalently:
#   cmake --install build --config Release
#
# By default the standalone goes to C:\Program Files\Obstacle\Obstacle.exe
# and the VST3 to C:\Program Files\Common Files\VST3\Obstacle.vst3 (so any
# DAW that scans the standard VST3 folder picks it up). A Start Menu
# shortcut named "Obstacle" is created in the *per-user* Start Menu
# folder so Windows search finds it — that one doesn't need admin.
#
# To install without admin, point CMAKE_INSTALL_PREFIX at a user folder:
#   cmake --install build --config Release --prefix C:\Users\<you>\Obstacle
# Then add the VST3 location to your DAW's scan paths.
# ==============================================================================
if(WIN32)
    # Where the VST3 bundle ends up. DAWs scan this folder by default.
    # Override with -DOBSTACLE_VST3_DIR="..." if you keep your VST3s
    # somewhere non-standard.
    if(NOT DEFINED OBSTACLE_VST3_DIR)
        set(OBSTACLE_VST3_DIR "C:/Program Files/Common Files/VST3")
    endif()

    # Standalone .exe → <prefix>/Obstacle.exe
    install(PROGRAMS $<TARGET_FILE:Obstacle_Standalone>
        DESTINATION .
        RENAME Obstacle.exe)

    # VST3 bundle → <OBSTACLE_VST3_DIR>/Obstacle.vst3
    # Note: $<TARGET_FILE:Obstacle_VST3> points at the inner .vst3
    # DLL inside the bundle, not at the bundle directory itself. JUCE
    # emits the bundle at <bin>/Obstacle_artefacts/<Config>/VST3/,
    # so we go through $<CONFIG> to pick the right one at install time.
    install(DIRECTORY
        "${CMAKE_BINARY_DIR}/Obstacle_artefacts/$<CONFIG>/VST3/Obstacle.vst3"
        DESTINATION "${OBSTACLE_VST3_DIR}")

    # Start Menu shortcut so Windows search picks up "Obstacle".
    # install(SCRIPT) runs the .cmake at install time on the host.
    install(SCRIPT "${CMAKE_CURRENT_SOURCE_DIR}/cmake/install-shortcut.cmake")

    # Ship the WebUI build output next to the standalone so the running
    # app can find WebUI/dist/index.html. findLocalWebUiDistIndex() in
    # WebViewEditor.cpp walks up from the executable looking for this
    # directory. Skip silently if it doesn't exist (e.g. a build done
    # without running `npm install && npm run build` first).
    if(EXISTS "${CMAKE_CURRENT_SOURCE_DIR}/WebUI/dist/index.html")
        install(DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/WebUI/dist"
            DESTINATION WebUI)
    endif()

    # Embed the WebUI into the VST3 bundle at build time
    # (Contents/Resources/WebUI/dist — copy_directory copies the *contents*
    # of the source dir, so the destination must include the dist level) so
    # the editor can always find it, regardless of which process hosts the
    # plugin. A build-time copy (not an install rule) so the elevated install
    # script (cmake/install-vst3-elevated.ps1), which copies the bundle
    # straight from the build tree, carries the UI too.
    #
    # The copy itself lives in cmake/copy-webui.cmake and runs on every VST3
    # link: a configure-time guard would miss a WebUI rebuilt after configure,
    # and copy_directory alone leaves stale hashed assets behind. The script
    # prunes the destination, and only warns when WebUI/dist is missing.
    add_custom_command(TARGET Obstacle_VST3 POST_BUILD
        COMMAND ${CMAKE_COMMAND}
            -DSRC="${CMAKE_CURRENT_SOURCE_DIR}/WebUI/dist"
            -DDST="$<TARGET_FILE_DIR:Obstacle_VST3>/../../Contents/Resources/WebUI/dist"
            -P "${CMAKE_CURRENT_SOURCE_DIR}/cmake/copy-webui.cmake"
        COMMENT "Embedding WebUI into VST3 bundle")
endif()