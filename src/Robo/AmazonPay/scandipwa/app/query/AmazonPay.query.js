/**
 * @category  Robo
 * @author    Rihards Stasans <torengo120@gmail.com>
 * @license   http://opensource.org/licenses/OSL-3.0 The Open Software License 3.0 (OSL-3.0)
 */

import { Field } from 'Util/Query';

/**
 * Amazon pay query
 */
export class AmazonPay {
    /**
     * Get config query
     *
     * @return {Field}
     */
    getConfigQuery() {
        return new Field('storeConfig')
            .addField(this._getPaymentConfigQuery());
    }

    /**
     * Get payment method config query
     *
     * @return {Field}
     * @private
     */
    _getPaymentConfigQuery() {
        return new Field('amazonPay')
            .addFieldList([
                'widget_url',
                'client_id',
                'merchant_id'
            ]);
    }
}

export default new AmazonPay();
