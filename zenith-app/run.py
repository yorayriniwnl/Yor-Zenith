import sys
import json

try:
    from lp_model import optimize_energy
    data = json.loads(sys.argv[1])
    result = optimize_energy(data)
    print(json.dumps(result))
except Exception as e:
    print(json.dumps({"error": str(e)}))
