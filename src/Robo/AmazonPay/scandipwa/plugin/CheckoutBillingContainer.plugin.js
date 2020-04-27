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
export class CheckoutBillingContainerPlugin {
    /**
     * Get payment method additional information
     */
    _getPaymentData(args, callback, instance) {
        const { paymentMethod: method } = instance.state;

        if (method === AMAZON_PAY) {
            const [asyncData] = args;
            const [{ token, order }] = asyncData;

            return {
                method,
                additional_data: {
                    token,
                    amazon_order_reference_id: order
                }
            };
        }

        return callback(args);
    }
}

const pluginContainer = new CheckoutBillingContainerPlugin();

const config = {
    'Component/CheckoutBilling/Container': {
        'instance': {
            'get': {
                '_getPaymentData': [
                    {
                        position: 100,
                        implementation: pluginContainer._getPaymentData
                    }
                ]
            }
        },
        'class': {
            'construct': {
            }
        }
    }
};

export default config;
