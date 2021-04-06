# Source 2 Image - using a private Repo

## Creating a Repository SSH Key


On UNIX systems, to create an SSH key you can use the ssh-keygen command.

We want to create a unique SSH key to be used just by OpenShift to access the private Git repository. We do not want to use the SSH key as a primary identity key, nor do we want to use an existing primary identity key. This is because it will be necessary to upload the private key of the SSH key pair to OpenShift.

When running ssh-keygen we, therefore, ensure we specify that the generated key should be saved as a separate set of key pair files using the -f option. The generated key should also not have a passphrase, so supply the -N '' option so a passphrase is not requested.

```bash
$ ssh-keygen -C "openshift-source-builder/repo@github" -f repo-at-github -N ''
```


The output from running the command should be similar to the following:
```ascii
Generating public/private rsa key pair.
Your identification has been saved in repo-at-github.
Your public key has been saved in repo-at-github.pub.

The key fingerprint is:
SHA256:z1tdP5Py+LAy7qOS2Zt5OCz0IADlvZPLThDlANPdzLs openshift-source-builder/repo@github

The key's randomart image is:
+---[RSA 2048]----+
| o+o..+          |
| .o.=. +         |
|  .o o  .        |
|   .. o.         |
|   ..+  S       .|
|    o.oE o   . .o|
|     +o B + .o.+.|
|    o  = *oB  * o|
|     .  o=Oo+o.o |
+----[SHA256]-----+
```

When an SSH key is generated, it is actually a pair of files. The first file is the public key file. In this case, this was called repo-at-github.pub.

The public key file is what we need to upload to GitHub and associate with the private Git repository.

The second file is the private key file. This was called repo-at-github.

The private key file is what we need to pass to OpenShift so that it will be able to access the private Git repository to pull down the source code.


## Register the keys
To register the private key file with OpenShift, the file without the .pub extension, we use the oc secrets new-sshauth command:

```bash
$ oc secrets new-sshauth repo-at-github --ssh-privatekey=repo-at-github
```


To mark that the secret can be used by the OpenShift project builder service account run:

```bash
$ oc secrets link builder repo-at-github
```
