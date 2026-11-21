@echo off
chcp 949 > nul
echo [제주 소원사] 위패 점안·봉안 대법회 블로그 복사기 및 사진 폴더를 엽니다...
start "" "%~dp005_naver_blog_rich_copy.html"
explorer "%~dp0blog_photos"
