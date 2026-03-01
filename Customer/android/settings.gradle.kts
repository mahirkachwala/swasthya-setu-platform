pluginManagement {
    val flutterSdkPath =
        run {
            val properties = java.util.Properties()
            file("local.properties").inputStream().use { properties.load(it) }
            val flutterSdkPath = properties.getProperty("flutter.sdk")
            require(flutterSdkPath != null) { "flutter.sdk not set in local.properties" }
            flutterSdkPath
        }

    includeBuild("$flutterSdkPath/packages/flutter_tools/gradle")

    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

plugins {
    // The Flutter plugin loader declaration was causing resolution errors on this
    // environment (resolved as an external plugin). The Flutter Tools includeBuild
    // should provide necessary build tooling; remove the explicit unresolved
    // plugin declaration to allow Gradle to continue. If you see plugin loader
    // issues later, restore or adapt this block.
    id("com.android.application") version "8.11.1" apply false
    id("org.jetbrains.kotlin.android") version "2.2.20" apply false
    id("com.google.gms.google-services") version "4.4.1" apply false
}

include(":app")

// Include Flutter plugin projects listed in .flutter-plugins (legacy) so Gradle
// can find and build platform-specific plugin modules. This mirrors the
// generated behavior Flutter expects during plugin resolution.
val flutterProjectRoot = rootDir.parentFile
val pluginsFile = java.io.File(flutterProjectRoot, ".flutter-plugins")
if (pluginsFile.exists()) {
    val properties = java.util.Properties()
    pluginsFile.reader(Charsets.UTF_8).use { properties.load(it) }
    properties.forEach { (name, path) ->
        val pluginName = name as String
        val pluginPath = path as String
        include(":$pluginName")
        project(":$pluginName").projectDir = file(pluginPath)
    }
}
