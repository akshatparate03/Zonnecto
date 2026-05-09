package com.zonnecto;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class ZonnectoApplication {

    public static void main(String[] args) {
        SpringApplication.run(ZonnectoApplication.class, args);
    }
}