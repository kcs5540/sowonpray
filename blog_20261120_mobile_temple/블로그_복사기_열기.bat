@echo off
chcp 65001 > nul
echo ========================================================
echo  [제주 소원사] 내 손안의 법당 · 네이버 블로그 원클릭 런처
echo ========================================================
echo.
echo 1. 브라우저로 05_naver_blog_rich_copy.html 복사기를 엽니다.
echo 2. blog_photos 폴더를 엽니다.
echo.
start "" "%~dp005_naver_blog_rich_copy.html"
start "" "%~dp0blog_photos"
