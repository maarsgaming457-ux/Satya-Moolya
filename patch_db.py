import os
import re

def patch_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Models patching
    content = content.replace("from sqlalchemy.dialects.postgresql import UUID", "from sqlalchemy import Uuid as UUID")
    content = content.replace("from sqlalchemy.dialects.postgresql import JSONB, UUID", "from sqlalchemy import JSON as JSONB, Uuid as UUID")
    content = content.replace("from sqlalchemy.dialects.postgresql import ENUM", "from sqlalchemy import Enum as ENUM")
    content = content.replace("from sqlalchemy.dialects.postgresql import ARRAY", "from sqlalchemy import JSON as ARRAY") # SQLite has no ARRAY, fallback to JSON
    
    # Migrations patching
    content = content.replace("postgresql.UUID(as_uuid=True)", "sa.Uuid()")
    content = content.replace("postgresql.UUID()", "sa.Uuid()")
    content = re.sub(r'postgresql\.JSONB\([^)]*\)', 'sa.JSON()', content)
    content = content.replace("postgresql.JSONB", "sa.JSON")
    content = content.replace("postgresql.ENUM", "sa.Enum")
    
    # Remove ENUM create/drop which are postgresql specific
    content = re.sub(r'^[ \t]*[a-zA-Z_]+\.create\(op\.get_bind\(\), checkfirst=True\)\n', '', content, flags=re.MULTILINE)
    content = re.sub(r'^[ \t]*postgresql\.ENUM\([^)]*\)\.drop\(op\.get_bind\(\), checkfirst=True\)\n', '', content, flags=re.MULTILINE)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

for root, _, files in os.walk('backend'):
    for file in files:
        if file.endswith('.py'):
            patch_file(os.path.join(root, file))

print("Patching complete!")
