package com.springboot.TaskO.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;


import java.util.Collections;
import java.util.List;
/*
    This class configures CORS, and specifies which methods are allowed
    along with which origins and headers
    @author: peter.song@oracle.com

 */
@Configuration
public class CorsConfig {
    Logger logger = LoggerFactory.getLogger(CorsConfig.class);
    
    @Bean
    public CorsFilter corsFilter(){
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of("http://localhost:3000","https://objectstorage.us-phoenix-1.oraclecloud.com",
                "https://petstore.swagger.io", "http://localhost:5173", "https://www.tasko.works"));
        config.setAllowedMethods(List.of("GET","POST","PUT","OPTIONS","DELETE","PATCH"));
        // Remove this line as it overrides the previous setAllowedOrigins call
        // config.setAllowedOrigins(Collections.singletonList("*"));
        config.addAllowedHeader("*");
        config.addExposedHeader("location");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}