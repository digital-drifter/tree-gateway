'use strict';

import * as Joi from 'joi';
import { MiddlewareConfig, middlewareConfigValidatorSchema } from './middleware';
import { ValidationError } from './errors';

/**
 * Configure Authentication for APIs.
 */
export interface AuthenticationConfig {
    /**
     * The strategy used for authentication
     */
    strategy: MiddlewareConfig;
}

export interface ApiAuthenticationConfig extends AuthenticationConfig {
    /**
     * A list of groups that should be handled by this authenticator. If not provided, everything
     * will be handled.
     * Defaults to *.
     */
    group?: Array<string>;
    /**
     * Import a configuration from gateway config session
     */
    use?: string;
}

export interface BasicAuthentication {
    /**
     * Is a function with the parameters verify(userid, password, done) {
     *  - userid The username.
     *  - password The password.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */
    verify: MiddlewareConfig;
}

export interface LocalAuthentication {
    /**
     * Is a function with the parameters verify(userid, password, done) {
     *  - userid The username.
     *  - password The password.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */
    verify: MiddlewareConfig;
    /**
     * Optional, defaults to 'username'
     */
    usernameField?: string;
    /**
     * Optional, defaults to 'password'
     */
    passwordField?: string;
}

export interface JWTAuthentication {
    /**
     * Is a REQUIRED string or buffer containing the secret (symmetric)
     * or PEM-encoded public key (asymmetric) for verifying the token's signature.
     */
    secretOrKey: string;
    /**
     * Defines how the JWT token will be extracted from request.
     */
    extractFrom?: JWTRequestExtractor;
    /**
     * If defined the token issuer (iss) will be verified against this value.
     */
    issuer?: string;
    /**
     * If defined, the token audience (aud) will be verified against this value.
     */
    audience?: string;
    /**
     * List of strings with the names of the allowed algorithms. For instance, ["HS256", "HS384"].
     */
    algorithms?: Array<string>;
    /**
     * If true do not validate the expiration of the token.
     */
    ignoreExpiration?: boolean;
    /**
     * Is a function with the parameters verify(request, jwt_payload, done)
     *  - request The user request.
     *  - jwt_payload is an object literal containing the decoded JWT payload.
     *  - done is a passport error first callback accepting arguments done(error, user, info)
     */
    verify?: MiddlewareConfig;
}

export interface JWTRequestExtractor {
    header?: string;
    queryParam?: string;
    authHeader?: string;
    bodyField?: string;
    cookie?: string;
}

const jwtRequestExtractorSchema = Joi.object().keys({
    authHeader: Joi.string(),
    bodyField: Joi.string(),
    cookie: Joi.string(),
    header: Joi.string(),
    queryParam: Joi.string()
});

const jwtAuthenticationSchema = Joi.object().keys({
    algorithms: Joi.array().items(Joi.string()),
    audience: Joi.string(),
    extractFrom: jwtRequestExtractorSchema,
    ignoreExpiration: Joi.boolean(),
    issuer: Joi.string(),
    secretOrKey: Joi.string().required(),
    verify: middlewareConfigValidatorSchema
});

const basicAuthenticationSchema = Joi.object().keys({
    verify: middlewareConfigValidatorSchema.required()
});

const localAuthenticationSchema = Joi.object().keys({
    passwordField: Joi.string(),
    usernameField: Joi.string(),
    verify: middlewareConfigValidatorSchema.required()
});

export let authenticationValidatorSchema = Joi.object().keys({
    strategy: middlewareConfigValidatorSchema.required()
});

export let apiAuthenticationValidatorSchema = authenticationValidatorSchema.keys({
    group: Joi.alternatives([Joi.array().items(Joi.string()), Joi.string()]),
    strategy: middlewareConfigValidatorSchema,
    use: Joi.string()
}).xor('strategy', 'use');

export function validateLocalAuthConfig(config: LocalAuthentication) {
    const result = Joi.validate(config, localAuthenticationSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

export function validateBasicAuthConfig(config: BasicAuthentication) {
    const result = Joi.validate(config, basicAuthenticationSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}

export function validateJwtAuthConfig(config: JWTAuthentication) {
    const result = Joi.validate(config, jwtAuthenticationSchema);
    if (result.error) {
        throw new ValidationError(result.error);
    } else {
        return result.value;
    }
}
