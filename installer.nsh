; MINSA Surat Manager — Custom NSIS installer script
; Adds Windows 10/11 compatibility requirements

!macro customHeader
  ; Require Windows 10 (build 10240) minimum
  !define WINVER 0x0A00
!macroend

!macro customInit
  ; Check Windows version: require Windows 10+
  ReadRegStr $0 HKLM "SOFTWARE\Microsoft\Windows NT\CurrentVersion" "CurrentMajorVersionNumber"
  ${If} $0 < 10
    MessageBox MB_OK|MB_ICONSTOP "MINSA Surat Manager memerlukan Windows 10 atau lebih baru.$\nSilakan perbarui sistem operasi Anda."
    Abort
  ${EndIf}
!macroend

!macro customInstall
  ; Create data directory for the user
  CreateDirectory "$APPDATA\MINSA-Surat-Manager"
!macroend

!macro customUnInstall
  ; Ask if user wants to remove data
  MessageBox MB_YESNO|MB_ICONQUESTION "Hapus data aplikasi (data surat)? Pilih Tidak untuk menyimpan data." IDNO +3
    RMDir /r "$APPDATA\MINSA-Surat-Manager"
    RMDir /r "$APPDATA\AZSTRAL-MINSA"
!macroend
