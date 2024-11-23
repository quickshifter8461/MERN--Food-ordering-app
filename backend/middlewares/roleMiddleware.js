
const express = require('express');
module.exports = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(401).json({ message: "Unauthorized: No user role found" });
            }
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ message: "Forbidden: You do not have access to this resource" });
            }
            next();
        } catch (error) {
            res.status(500).json({ message: "An error occurred in role-based access control", error: error.message });
        }
    };
};
