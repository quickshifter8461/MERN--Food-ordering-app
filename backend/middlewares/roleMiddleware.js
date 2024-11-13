
const express = require('express');
module.exports = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Check if the user is authenticated and has a role
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: "Unauthorized: No user role found" });
            }

            // Check if the user's role is in the allowed roles
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
            }

            // User has required role, proceed to the next middleware or route handler
            next();
        } catch (error) {
            res.status(500).json({ message: "An error occurred in role-based access control", error: error.message });
        }
    };
};
