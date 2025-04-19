package com.springboot.MyTodoList.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardingController {

    /**
     * Forward all requests to the frontend SPA except for paths that:
     * - Start with /api/ (handled by Spring REST controllers)
     * - Have file extensions (static resources)
     * - Are specifically excluded paths
     */
    @RequestMapping(value = {"/{path:^(?!api|assets).*$}/**"})
    public String forwardToRouterPath() {
        return "forward:/index.html";
    }
    
    /**
     * Handle the root path
     */
    @RequestMapping("/")
    public String forwardRoot() {
        return "forward:/index.html";
    }
}