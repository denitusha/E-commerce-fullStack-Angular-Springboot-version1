package com.ecommerce.springboot.project.config;
import com.okta.spring.boot.oauth.Okta;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.accept.ContentNegotiationStrategy;
import org.springframework.web.accept.HeaderContentNegotiationStrategy;

@Configuration
public class SecurityConfiguration {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        // protect endpoint /api/orders
        http.authorizeHttpRequests(configurer ->
                        configurer
                                .requestMatchers("/api/orders/**")
                                .authenticated().anyRequest().permitAll())
                .oauth2ResourceServer((oauth2) -> oauth2
                        .jwt(Customizer.withDefaults()));

        // add CORS filters
        http.cors(Customizer.withDefaults());

        // add content negotiation strategy
        http.setSharedObject(ContentNegotiationStrategy.class,
                new HeaderContentNegotiationStrategy());

        // force a non-empty response body for 401's to make the response more friendly
        Okta.configureResourceServer401ResponseBody(http);

        //disable CSRF since we are not using cookies for session
        // we are not using Cookies for session tracking >> disable CSRF
        http.csrf(csrf -> csrf.disable());
        return http.build();
    }
}

