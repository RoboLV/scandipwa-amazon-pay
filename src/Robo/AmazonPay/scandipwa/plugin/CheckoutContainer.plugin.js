/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import React from 'react';

import {AMAZON_PAY} from 'CheckoutPayments.container.plugin';

/**
 * Container
 */

export class CheckoutContainerPlugin {
    /**
     * Add amazon to custom methods
     */
    customPaymentMethods(originalMember, instance) {
        return [
            ...originalMember,
            AMAZON_PAY
        ]
    }
}


const pluginContainer = new CheckoutContainerPlugin();

const config = {
    'Route/Checkout/Container': {
        'instance': {
            'get': {
            }
        },
        'class': {
            'construct': {
                'customPaymentMethods': [
                    {
                        position: 100,
                        implementation: pluginContainer.customPaymentMethods
                    }
                ]
            }
        }
    }
};

export default config;
