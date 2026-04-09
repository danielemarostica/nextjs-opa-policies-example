package authz

import future.keywords.if
import future.keywords.in

# -----------------------------------------------
# ENTRYPOINT
# The middleware calls: POST /v1/data/authz/allow
# with input: { user: { id, role, permissions[] }, action, resource }
# -----------------------------------------------

default allow := false

# Role-based access: check the role_permissions table
allow if {
    input.action in role_permissions[input.user.role]
}

# Fine-grained: check explicit user permissions (overrides role)
allow if {
    input.action in input.user.permissions
}

# -----------------------------------------------
# ROLE → ACTIONS mapping
# This is the policy data. Change here, no redeploy needed.
# -----------------------------------------------

role_permissions := {
    "admin": {
        "dashboard:read",
        "dashboard:write",
        "reports:read",
        "reports:write",
        "reports:export",
        "admin:read",
        "admin:write",
        "admin:delete"
    },
    "editor": {
        "dashboard:read",
        "dashboard:write",
        "reports:read",
        "reports:write",
        "reports:export"
    },
    "viewer": {
        "dashboard:read",
        "reports:read"
    },
    "guest": {
        "dashboard:read"
    }
}

# -----------------------------------------------
# RESOURCE-LEVEL RULES
# Example: reports can only be exported on weekdays
# -----------------------------------------------

allow if {
    input.action == "reports:export"
    input.user.role in {"editor", "admin"}
    is_weekday
}

# Deny export on weekends regardless of role (except admin - covered above)
deny_reason := "exports are not allowed on weekends" if {
    input.action == "reports:export"
    input.user.role == "editor"
    not is_weekday
}

# -----------------------------------------------
# HELPERS
# -----------------------------------------------

is_weekday if {
    # 0 = Sunday, 6 = Saturday in OPA's time.weekday
    day := time.weekday(time.now_ns())
    not day in {"Saturday", "Sunday"}
}
