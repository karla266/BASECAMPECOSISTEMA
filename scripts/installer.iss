#define MyAppName "Basecamp420 POS"
#define MyAppVersion "1.0.0"
#define MyAppPublisher "Basecamp 420"
#define MyAppExeName "Basecamp420_POS.exe"
#define BuildRoot "..\\dist\\Basecamp420_POS"

[Setup]
AppId={{A2A5A3AA-853F-4E7E-8F2D-4E8566789B62}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\Basecamp420 POS
DefaultGroupName=Basecamp420 POS
DisableProgramGroupPage=yes
OutputDir=..\dist_installer
OutputBaseFilename=Basecamp420_POS_Setup
Compression=lzma
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
UninstallDisplayIcon={app}\{#MyAppExeName}
ArchitecturesInstallIn64BitMode=x64

[Languages]
Name: "spanish"; MessagesFile: "compiler:Languages\Spanish.isl"

[Tasks]
Name: "desktopicon"; Description: "Crear acceso directo en escritorio"; GroupDescription: "Accesos directos:"

[Files]
Source: "{#BuildRoot}\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

[Dirs]
Name: "{localappdata}\Basecamp420"
Name: "{localappdata}\Basecamp420\data"; Permissions: users-modify
Name: "{localappdata}\Basecamp420\data\media"; Permissions: users-modify

[Icons]
Name: "{autoprograms}\Basecamp420 POS"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\Basecamp420 POS"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{app}\{#MyAppExeName}"; Description: "Abrir Basecamp420 POS ahora"; Flags: nowait postinstall skipifsilent
