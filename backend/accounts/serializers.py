from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User


class UserSerializer(serializers.ModelSerializer):
    role = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'phone', 'avatar', 'role', 'date_joined']
        read_only_fields = ['id', 'email', 'role', 'date_joined']

    def get_role(self, obj):
        return 'admin' if obj.is_staff else 'user'


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['name', 'email', 'phone', 'password']

    def validate_email(self, v):
        v = v.lower()
        if User.objects.filter(email__iexact=v).exists():
            raise serializers.ValidationError('Is email se account pehle se maujood hai.')
        return v

    def validate_password(self, v):
        validate_password(v)
        return v

    def create(self, data):
        return User.objects.create_user(**data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField()
    new_password = serializers.CharField(min_length=6)


class LoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        attrs['email'] = attrs.get('email', '').lower()
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user, context=self.context).data
        return data
