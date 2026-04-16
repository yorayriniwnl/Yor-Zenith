import sys
import json
import re


def load_payload(raw_arg):
    try:
        return json.loads(raw_arg)
    except json.JSONDecodeError:
        normalized = re.sub(
            r'([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)(\s*:)',
            r'\1"\2"\3',
            raw_arg,
        )
        return json.loads(normalized)

try:
    from lp_model import optimize_energy
    data = load_payload(sys.argv[1])
    result = optimize_energy(data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
