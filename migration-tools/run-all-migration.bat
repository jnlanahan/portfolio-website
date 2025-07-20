@echo off
echo ========================================
echo COMPLETE MIGRATION SCRIPT
echo ========================================
echo.

echo Step 1: Verifying migration...
echo --------------------------------
call npx tsx migration-tools/06-verify-migration.ts
echo.
echo Press any key to continue...
pause > nul

echo Step 2: Checking git status...
echo --------------------------------
git status
echo.
echo Press any key to continue...
pause > nul

echo Step 3: Adding all files to git...
echo --------------------------------
git add .
echo Done!
echo.

echo Step 4: Creating commit...
echo --------------------------------
git commit -m "Complete migration from Replit with all data and files"
echo.

echo Step 5: Pushing to Railway...
echo --------------------------------
git push origin main
echo.

echo ========================================
echo MIGRATION COMPLETE!
echo ========================================
echo.
echo Railway will now redeploy your site.
echo Check your Railway dashboard in 2-3 minutes.
echo.
pause