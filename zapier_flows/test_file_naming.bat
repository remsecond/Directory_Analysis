@echo off
REM Test file naming schema with various scenarios

REM Create test directory structure
mkdir test_naming\input 2>nul
mkdir test_naming\output 2>nul

REM Test Case 1: Court Order Document
echo Creating test case 1 - Court Order...
copy nul "test_naming\input\custody_modification_order.pdf"
echo CASE202401001_ORDER_20240115_OFW_SMITHJ_custody_modification_order.pdf > "test_naming\output\example1.txt"

REM Test Case 2: Email with Attachment
echo Creating test case 2 - Email Attachment...
copy nul "test_naming\input\bank_statement_december.pdf"
echo CASE202401001_FIN_20240115_EMAIL_DOEJ_bank_statement_december.pdf > "test_naming\output\example2.txt"

REM Test Case 3: Evaluation Report
echo Creating test case 3 - Evaluation Report...
copy nul "test_naming\input\psychological_evaluation.docx"
echo CASE202401001_EVAL_20240115_UPLOAD_psychological_evaluation.pdf > "test_naming\output\example3.txt"

REM Test Case 4: Multiple Versions
echo Creating test case 4 - Multiple Versions...
copy nul "test_naming\input\parenting_plan_draft1.docx"
copy nul "test_naming\input\parenting_plan_draft2.docx"
echo CASE202401001_MED_20240115_UPLOAD_SMITHJ_V01_parenting_plan.docx > "test_naming\output\example4a.txt"
echo CASE202401001_MED_20240115_UPLOAD_SMITHJ_V02_parenting_plan.docx > "test_naming\output\example4b.txt"

REM Test Case 5: OFW Export
echo Creating test case 5 - OFW Export...
copy nul "test_naming\input\OFW_Messages_Report_2024-01-15.pdf"
echo CASE202401001_CORR_20240115_OFW_messages_report.pdf > "test_naming\output\example5.txt"

echo.
echo Test files created with standardized naming examples:
echo.
echo Original Files:
dir /b "test_naming\input"
echo.
echo Standardized Names:
type "test_naming\output\example1.txt"
type "test_naming\output\example2.txt"
type "test_naming\output\example3.txt"
type "test_naming\output\example4a.txt"
type "test_naming\output\example4b.txt"
type "test_naming\output\example5.txt"
echo.
echo Naming Pattern:
echo {case_identifier}_{document_type}_{date_code}_{source}[_{party_code}][_V{sequence}]_{original_filename}
echo.
echo Core Fields:
echo - Case ID: CASE{YYYY}{MM}{sequential}
echo - Document Types: ORDER, EVAL, CORR, FIN, MED
echo - Date Code: {YYYY}{MM}{DD}
echo - Source: OFW, EMAIL, UPLOAD, SCAN
echo.
echo Optional Fields:
echo - Party Code: {LASTNAME}{F}
echo - Sequence: V{nn}
echo.
echo Note: Original filename is preserved at the end for reference
