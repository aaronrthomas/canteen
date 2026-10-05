@REM Maven Wrapper script for Windows
@IF "%MAVEN_WRAPPER_JAR%" == "" SET MAVEN_WRAPPER_JAR="%~dp0.mvn/wrapper/maven-wrapper.jar"
@IF "%MVNW_USERNAME%" == "" (
  @IF EXIST "%USERPROFILE%\.m2\wrapper\dists" SET MVNW_REPOURL=
)
@SET WRAPPER_JAR=%~dp0.mvn/wrapper/maven-wrapper.jar
@java -jar "%WRAPPER_JAR%" %*
