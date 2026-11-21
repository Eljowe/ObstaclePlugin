# Copies the WebUI build output into the VST3 bundle. Run at *build* time
# (`cmake -DSRC=... -DDST=... -P cmake/copy-webui.cmake` from a POST_BUILD
# command) so a freshly rebuilt WebUI is always embedded, even when the
# configure step never saw it.
#
# Vite emits content-hashed asset filenames, so copy_directory alone would
# leave stale index-<hash>.js/css files in the bundle: the destination is
# removed first and then repopulated.
#
# A missing WebUI/dist (a build without `npm install && npm run build`) only
# warns, so the C++ targets still build; such a plugin simply has no UI.

if(NOT DEFINED SRC OR NOT DEFINED DST)
    message(FATAL_ERROR "copy-webui.cmake requires -DSRC=<dir> and -DDST=<dir>")
endif()

if(EXISTS "${SRC}/index.html")
    file(REMOVE_RECURSE "${DST}")
    file(COPY "${SRC}/" DESTINATION "${DST}")

    if(NOT EXISTS "${DST}/index.html")
        message(FATAL_ERROR "Failed to embed WebUI: could not copy ${SRC} to ${DST}")
    endif()
else()
    message(WARNING "WebUI/dist/index.html not found (${SRC}); embedding skipped. "
                    "Run `npm install` and `npm run build` in WebUI/ to embed the UI.")
endif()
