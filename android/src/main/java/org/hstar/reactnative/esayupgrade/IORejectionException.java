package org.hstar.reactnative.esayupgrade;

public class IORejectionException extends Exception {
    private String code;

    public IORejectionException(String code, String message) {
        super(message);
        this.code = code;
    }

    public String getCode() {
        return code;
    }
}
